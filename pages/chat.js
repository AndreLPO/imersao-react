import { Box, Text, TextField, Image, Button } from "@skynexui/components";
import React, { useEffect, useState } from "react";
import appConfig from "../config.json";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/router";
import { ButtonSendSticker } from "../src/components/ButtonSendSticker";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

function escutaMensagemEmTempoReal(adicionaMensagem) {
  return supabaseClient
    .from("MENSAGENS")
    .on("INSERT", (dados) => {
      adicionaMensagem(dados.new);
    })
    .subscribe();
}

export default function ChatPage() {
  // Sua lógica vai aqui
  const roteamento = useRouter();
  const usuarioLogado = roteamento.query.username;
  const [mensagem, setMensagem] = useState();
  const [listaMensagem, setListaMensagem] = useState([]);

  useEffect(() => {
    supabaseClient
      .from("MENSAGENS")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setListaMensagem(data);
      });

    escutaMensagemEmTempoReal((novaMsg) => {
      setListaMensagem((valorAtualDaLista) => {
        return [novaMsg, ...valorAtualDaLista];
      });
    });
  }, []);

  function handleNovaMensagem(novaMensagem) {
    const mensagem = {
      de: usuarioLogado,
      texto: novaMensagem,
    };
    novaMensagem &&
      (supabaseClient
        .from("MENSAGENS")
        .insert([mensagem])
        .then(({ data }) => {}),
      setMensagem(""));
  }
  // ./Sua lógica vai aqui
  return (
    <Box
      styleSheet={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: appConfig.theme.colors.primary[500],
        backgroundImage: `url(https://virtualbackgrounds.site/wp-content/uploads/2020/08/the-matrix-digital-rain.jpg)`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundBlendMode: "multiply",
        color: appConfig.theme.colors.neutrals["000"],
      }}
    >
      <Box
        styleSheet={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          boxShadow: "0 2px 10px 0 rgb(0 0 0 / 20%)",
          borderRadius: "5px",
          backgroundColor: appConfig.theme.colors.neutrals[700],
          height: "100%",
          maxWidth: "95%",
          maxHeight: "95vh",
          padding: "32px",
        }}
      >
        <Header />
        <Box
          styleSheet={{
            position: "relative",
            display: "flex",
            flex: 1,
            height: "80%",
            backgroundColor: appConfig.theme.colors.neutrals[600],
            flexDirection: "column",
            borderRadius: "5px",
            padding: "16px",
          }}
        >
          {/* {listaMensagem.map((msg) => {
            return <li key={msg.id}>{msg.texto}</li>;
          })} */}
          <MessageList mensagens={listaMensagem} />
          <Box
            as="form"
            styleSheet={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <ButtonSendSticker
              onStickerClick={(sticker) => {
                handleNovaMensagem(`:sticker:${sticker}`);
              }}
            />
            <TextField
              placeholder="Insira sua mensagem aqui..."
              type="textarea"
              value={mensagem}
              onKeyPress={(e) => {
                if (e.code === "Enter") {
                  handleNovaMensagem(mensagem);
                  e.preventDefault();
                }
              }}
              onChange={(e) => {
                setMensagem(e.target.value);
              }}
              styleSheet={{
                width: "100%",
                border: "0",
                resize: "none",
                borderRadius: "5px",
                padding: "6px 8px",
                backgroundColor: appConfig.theme.colors.neutrals[800],
                marginRight: "12px",
                color: appConfig.theme.colors.neutrals[200],
              }}
            />
            <Button
              onClick={() => handleNovaMensagem(mensagem)}
              label="Entrar"
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

function Header() {
  return (
    <>
      <Box
        styleSheet={{
          width: "100%",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text variant="heading5">Chat</Text>
        <Button
          variant="tertiary"
          colorVariant="neutral"
          label="Logout"
          href="/"
        />
      </Box>
    </>
  );
}

function MessageList(props) {
  const mensagem = props.mensagens;
  return (
    <Box
      tag="ul"
      styleSheet={{
        overflowY: "scroll",
        display: "flex",
        flexDirection: "column-reverse",
        flex: 1,
        color: appConfig.theme.colors.neutrals["000"],
        marginBottom: "16px",
      }}
    >
      {mensagem.map((msg) => {
        return (
          <Text
            key={msg.id}
            tag="li"
            styleSheet={{
              borderRadius: "5px",
              padding: "6px",
              marginBottom: "12px",
              hover: {
                backgroundColor: appConfig.theme.colors.neutrals[700],
              },
            }}
          >
            <Box
              styleSheet={{
                marginBottom: "8px",
              }}
            >
              <Image
                styleSheet={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  display: "inline-block",
                  marginRight: "8px",
                }}
                src={`https://github.com/${msg.de}.png`}
              />
              <Text tag="strong">{msg.de}</Text>
              <Text
                styleSheet={{
                  fontSize: "10px",
                  marginLeft: "8px",
                  color: appConfig.theme.colors.neutrals[300],
                }}
                tag="span"
              >
                {new Date().toLocaleDateString()}
              </Text>
            </Box>
            {msg.texto.startsWith(":sticker:") ? (
              <Image
                styleSheet={{
                  maxWidth: "20%",
                }}
                src={msg.texto.replace(":sticker:", "")}
              />
            ) : (
              msg.texto
            )}
          </Text>
        );
      })}
    </Box>
  );
}

import { Before, Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";
import livrosApi from "../api/livrosApi";

let token;
let livro;
let resposta;

Before(() => {
  cy.geraToken("admin@biblioteca.com", "admin123").then((tkn) => {
    token = tkn;
  });
});

Given("que tenho os dados de um livro válido", () => {
  livro = {
    title: `Livro de Teste ${Date.now()}`,
    author: "Machado de Assis",
  };
});

Given("que tenho os dados de um livro inválido", () => {
  livro = { title: "" }; // adapte
});

When("eu cadastro o livro no catálogo", () => {
  livrosApi.cadastrar(livro, token).then((res) => {
    resposta = res;
  });
});

Then("o livro deve ser criado com sucesso", () => {
  expect(token, "token").to.be.a("string");
  expect(resposta.status, JSON.stringify(resposta.body)).to.eq(201);
});

Then("o sistema deve rejeitar o cadastro", () => {
  expect(token, "token").to.be.a("string");
  expect(resposta.status, JSON.stringify(resposta.body)).to.eq(400);
});
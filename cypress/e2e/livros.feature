# language: pt
Funcionalidade: Catálogo de Livros
  Como usuário do Hub de Leitura
  Quero gerenciar o catálogo de livros
  Para manter a lista de leituras atualizada

  Cenário: Cadastrar um livro com dados válidos
    Dado que tenho os dados de um livro válido
    Quando eu cadastro o livro no catálogo
    Então o livro deve ser criado com sucesso

  Cenário: Tentar cadastrar um livro com dados inválidos
    Dado que tenho os dados de um livro inválido
    Quando eu cadastro o livro no catálogo
    Então o sistema deve rejeitar o cadastro
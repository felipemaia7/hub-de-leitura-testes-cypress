class LivrosApi {
  cadastrar(livro, token) {
    const autorizacao = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    return cy.request({
      method: "POST",
      url: "books",
      headers: { Authorization: autorizacao },
      body: livro,
      failOnStatusCode: false,
    });
  }
}

export default new LivrosApi();

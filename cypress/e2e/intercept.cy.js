describe('Hub de Leitura - Intercept', () => {

  beforeEach(() => {
    // Abre uma página do servidor para o fetch ter a mesma origem
    cy.visit('http://localhost:3000', { failOnStatusCode: false })
  })

  it('Deve listar livros com sucesso usando resposta mockada (positivo)', () => {
    cy.intercept('GET', '**/api/books*', {
      statusCode: 200,
      fixture: 'livros-mock.json'
    }).as('getLivros')

    cy.window().then((win) => {
      return win.fetch('/api/books').then((resposta) => resposta.json())
    }).then((corpo) => {
      expect(corpo.data[0].title).to.eq('Livro Mockado')
    })

    cy.wait('@getLivros').its('response.statusCode').should('eq', 200)
  })

  it('Deve tratar erro 500 do servidor ao listar livros (negativo)', () => {
    cy.intercept('GET', '**/api/books*', {
      statusCode: 500,
      body: { error: 'Erro interno do servidor' }
    }).as('getLivrosErro')

    cy.window().then((win) => {
      return win.fetch('/api/books').then((resposta) => resposta.json().then((corpo) => ({
        status: resposta.status,
        corpo
      })))
    }).then((resultado) => {
      expect(resultado.status).to.eq(500)
      expect(resultado.corpo.error).to.eq('Erro interno do servidor')
    })

    cy.wait('@getLivrosErro').its('response.statusCode').should('eq', 500)
  })

})
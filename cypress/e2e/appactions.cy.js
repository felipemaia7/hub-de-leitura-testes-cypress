
describe('Hub de Leitura - AppActions', () => {
  let token
  let idLivro

  beforeEach(() => {
    idLivro = undefined

    cy.geraToken('admin@biblioteca.com', 'admin123').then((tkn) => {
      token = tkn
    })
  })

  it('Deve criar um livro via ação da aplicação e consultá-lo', () => {
    const livro = {
      title: `Livro AppActions ${Date.now()}`,
      author: 'Autor Teste',
      category: 'Tecnologia'
    }

    cy.criarLivroViaApi(token, livro).then((resposta) => {
      expect(resposta.status).to.eq(201)

      cy.log(JSON.stringify(resposta.body))

      const livroCriado = resposta.body.book
        || resposta.body.data
        || resposta.body

      idLivro = livroCriado.id

      expect(idLivro, 'ID do livro criado').to.exist

      cy.request(`books/${idLivro}`).then((consulta) => {
        expect(consulta.status).to.eq(200)
      })
    })
  })

  afterEach(() => {
    if (idLivro) {
      cy.deletarLivroViaApi(token, idLivro)
    }
  })
})

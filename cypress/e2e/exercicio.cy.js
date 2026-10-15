// <reference types="cypress" />
 
describe('Testes da Funcionalidade Catálogo de Livros', () => {
 
    let token
    beforeEach(() => {
        cy.geraToken('admin@biblioteca.com', 'admin123').then(tkn => {
            token = tkn
        })
    });
 
    // AJUSTE: confira no seu Postman os campos exigidos pelo POST /books
    const novoLivro = () => ({
        title: `Livro Teste ${Date.now()}`,
        author: 'Autor Teste',
        category: 'Tecnologia',
        isbn: `${Date.now()}`,
        description: 'Livro criado pela automação com Cypress'
    })
 
    // Cria um livro e devolve o corpo da resposta (usado nos testes de GET, PUT e DELETE)
    const criaLivro = () => {
        return cy.request({
            method: 'POST',
            url: '/books',
            headers: { Authorization: token },
            body: novoLivro()
        })
    }
 
    // Procura, em qualquer nível da resposta, o objeto que tem "id" (ou "_id")
    // Assim funciona se o livro vier direto, em "data", em "book", em "livro" etc.
    const achaLivro = (obj) => {
        if (obj && typeof obj === 'object') {
            if (obj.id !== undefined || obj._id !== undefined) return obj
            for (const chave of Object.keys(obj)) {
                const achado = achaLivro(obj[chave])
                if (achado) return achado
            }
        }
        return undefined
    }
    const extraiLivro = (body) => achaLivro(body) || body
    const extraiId = (body) => {
        const livro = achaLivro(body)
        return livro ? (livro.id !== undefined ? livro.id : livro._id) : undefined
    }
 
    // Objetivo: Verificar que a API retorna lista de livros com paginação e filtros funcionando
    // Validar que filtros por categoria e autores funcionam corretamente
    it('GET - Deve listar livros com filtros e paginação', () => {
        cy.request({
            method: 'GET',
            url: '/books',
            headers: { Authorization: token },
            qs: { page: 1, limit: 5 } // AJUSTE: nomes dos parâmetros de paginação e filtro
        }).then(res => {
            expect(res.status).to.eq(200)
            expect(res.body).to.be.an('object')
            // AJUSTE: use o nome real da lista (data, books, items...)
            const lista = res.body.data || res.body.books || res.body
            expect(lista).to.be.an('array')
            expect(lista.length).to.be.at.most(5)
        })
 
        // Filtro por categoria
        cy.request({
            method: 'GET',
            url: '/books',
            headers: { Authorization: token },
            qs: { category: 'Tecnologia' } // AJUSTE: use uma categoria que exista na sua base
        }).then(res => {
            expect(res.status).to.eq(200)
        })
    });
 
    // Objetivo: Validar que é possível obter detalhes de um livro específico pelo ID
    // Verificar que todos os campos do livro são retornados corretamente
    it('GET - Deve obter detalhes de um livro específico', () => {
        const livro = novoLivro()
        cy.request({
            method: 'POST',
            url: '/books',
            headers: { Authorization: token },
            body: livro
        }).then(resPost => {
            const id = extraiId(resPost.body)
 
            cy.request({
                method: 'GET',
                url: `/books/${id}`,
                headers: { Authorization: token }
            }).then(res => {
                expect(res.status).to.eq(200)
                const dados = extraiLivro(res.body)
                expect(dados).to.have.property('title', livro.title)
                expect(dados).to.have.property('author', livro.author)
                expect(dados).to.have.property('category', livro.category)
            })
        })
    });
 
    // Objetivo: Validar que um novo livro é adicionado com sucesso ao catálogo
    // Verificar que apenas admin pode adicionar novos livros (validação de permissão)
    it('POST - Deve cadastrar um novo livro com sucesso', () => {
        const livro = novoLivro()
        cy.request({
            method: 'POST',
            url: '/books',
            headers: { Authorization: token },
            body: livro
        }).then(res => {
            expect(res.status).to.eq(201)
            const dados = extraiLivro(res.body)
            expect(extraiId(res.body)).to.exist
            expect(dados).to.have.property('title', livro.title)
        })
 
        // Permissão: sem token a API deve recusar
        cy.request({
            method: 'POST',
            url: '/books',
            body: novoLivro(),
            failOnStatusCode: false
        }).then(res => {
            expect(res.status).to.eq(401)
        })
    });
 
    // Objetivo: Garantir que dados inválidos são rejeitados ao adicionar um livro
    // Validar mensagens de erro apropriadas para dados faltantes ou incorretos
    it('POST -  Deve rejeitar livro com dados inválidos', () => {
        cy.request({
            method: 'POST',
            url: '/books',
            headers: { Authorization: token },
            body: { title: '' }, // dados faltantes/incorretos
            failOnStatusCode: false
        }).then(res => {
            expect(res.status).to.eq(400)
            // AJUSTE: confira o nome do campo da mensagem de erro (message, error, errors...)
            expect(res.body).to.have.any.keys('message', 'error', 'errors')
        })
    });
 
    // Objetivo: Validar que um livro pode ser atualizado com sucesso
    // Verificar que apenas admin pode atualizar livros (validação de permissão)
    it('PUT - Deve atualizar um livro previamente cadastrado', () => {
        criaLivro().then(resPost => {
            const id = extraiId(resPost.body)
            const atualizado = { ...novoLivro(), title: `Livro Atualizado ${Date.now()}` }
 
            cy.request({
                method: 'PUT',
                url: `/books/${id}`,
                headers: { Authorization: token },
                body: atualizado
            }).then(res => {
                expect(res.status).to.eq(200)
                // O PUT devolve apenas uma mensagem de confirmação (sem o livro)
                expect(res.body).to.have.property('message')
 
                // Confirma a atualização consultando o livro
                cy.request({
                    method: 'GET',
                    url: `/books/${id}`,
                    headers: { Authorization: token }
                }).then(resGet => {
                    expect(resGet.status).to.eq(200)
                    expect(extraiLivro(resGet.body)).to.have.property('title', atualizado.title)
                })
            })
 
            // Permissão: sem token a API deve recusar
            cy.request({
                method: 'PUT',
                url: `/books/${id}`,
                body: atualizado,
                failOnStatusCode: false
            }).then(res => {
                expect(res.status).to.eq(401)
            })
        })
    });
 
    // Objetivo: Validar que um livro pode ser removido do catálogo
    // Verificar que apenas admin pode deletar livros (validação de permissão)
    it('DELETE - Deve deletar um livro previamente cadastrado', () => {
        criaLivro().then(resPost => {
            const id = extraiId(resPost.body)
 
            // Permissão: sem token a API deve recusar
            cy.request({
                method: 'DELETE',
                url: `/books/${id}`,
                failOnStatusCode: false
            }).then(res => {
                expect(res.status).to.eq(401)
            })
 
            cy.request({
                method: 'DELETE',
                url: `/books/${id}`,
                headers: { Authorization: token }
            }).then(res => {
                expect(res.status).to.eq(200)
            })
 
            // Confirma que o livro não existe mais
            cy.request({
                method: 'GET',
                url: `/books/${id}`,
                headers: { Authorization: token },
                failOnStatusCode: false
            }).then(res => {
                expect(res.status).to.eq(404)
            })
        })
    });
});
 
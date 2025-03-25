describe('Odpowiadanie na pytania z różnych dziedzin', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.get('input[name="email"]').type('wojtek.pestka@onet.pl');
    cy.get('input[name="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
   
    cy.url().should('include', '/menu');

  });

  const answerSingleQuestion = (categoryButtonSelector, categoryUrl) => {
    cy.get('.learn-button').click();
    cy.get(categoryButtonSelector).click();

    cy.url().should('include', categoryUrl);


    cy.get('.question-box').should('be.visible');

    cy.get('.answers button').first().click();

    cy.get('.feedback').should('be.visible');

    cy.get('.back-button').click();
  };

  it('Powinno odpowiedzieć na jedno pytanie programistyczne', () => {
    answerSingleQuestion('.programming-questions-button', '/programming-questions');
  });

  it('Powinno odpowiedzieć na jedno pytanie matematyczne', () => {
    answerSingleQuestion('.math-questions-button', '/math-questions');
  });

  it('Powinno odpowiedzieć na jedno pytanie z nauk ścisłych', () => {
    answerSingleQuestion('.science-questions-button', '/science-questions');
  });

  it('Powinno odpowiedzieć na jedno pytanie z angielskiego', () => {
    answerSingleQuestion('.english-questions-button', '/english-questions');
  });

  afterEach(() => {
    cy.get('.logout-icon').click();
    cy.url().should('include', '/login');
  });
});
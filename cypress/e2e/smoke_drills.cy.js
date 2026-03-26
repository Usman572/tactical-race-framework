describe('Tactical Matrix: Smoke Drills', () => {
    beforeEach(() => {
        cy.visit('/');
    });

    it('should confirm the Signal Bridge is operational (Branding)', () => {
        cy.contains('Circuit').should('be.visible');
        cy.contains('Quantum').should('be.visible');
    });

    it('should allow operative authentication access', () => {
        cy.get('a[href="/login"]').click();
        cy.url().should('include', '/login');
        cy.get('input[type="email"]').should('be.visible');
        cy.get('input[type="password"]').should('be.visible');
    });

    it('should project the Global Mission Pulse', () => {
        // Since missions are dynamic, we just check if the layout contains the container
        // Our GlobalMissionAlert returns null if no events, but we can verify the API call or mock it
        cy.intercept('GET', '**/api/events', {
            statusCode: 200,
            body: [{
                _id: 'test-event-id',
                id: 'CYPRESS-DRILL',
                title: 'Operation Smoke Screen',
                description: 'Verifying automated tactical readiness.',
                type: 'OBJECTIVE',
                endTime: new Date(Date.now() + 3600000).toISOString(),
                isActive: true
            }]
        }).as('getEvents');

        cy.reload();
        cy.wait('@getEvents');
        cy.contains('Operation Smoke Screen').should('be.visible');
    });
});

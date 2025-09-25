// Defines custom error types for the application, providing more context
// than generic errors. This is particularly useful for debugging Firestore
// security rule violations, as it allows us to capture and display
// the context of the failed request.

export type SecurityRuleContext = {
    path: string;
    operation: 'get' | 'list' | 'create' | 'update' | 'delete' | 'write';
    requestResourceData?: any;
};

export class FirestorePermissionError extends Error {
    public context: SecurityRuleContext;

    constructor(context: SecurityRuleContext) {
        const message = `FirestoreError: Missing or insufficient permissions: The following request was denied by Firestore Security Rules:\n${JSON.stringify(context, null, 2)}`;
        super(message);
        this.name = 'FirestorePermissionError';
        this.context = context;
        
        // This is to ensure the prototype chain is correctly set up
        Object.setPrototypeOf(this, FirestorePermissionError.prototype);
    }

    public toString(): string {
        return this.message;
    }
}

const stripe = {
    charges: {
        create: jest.fn().mockResolvedValue({
            id: "fakeStripeId"
        })
    }
};

export { stripe };

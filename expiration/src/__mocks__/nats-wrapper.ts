const natsWrapper = {
    client: {
        publish: jest
            .fn()
            .mockImplementation(
                (
                    _subject: string,
                    _data: string,
                    callback: () => void
                ): void => {
                    callback();
                }
            )
    }
};

export { natsWrapper };

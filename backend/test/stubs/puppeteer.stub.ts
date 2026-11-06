export const launch = jest.fn().mockImplementation(async () => {
  return {
    newPage: jest.fn().mockResolvedValue({
      setContent: jest.fn().mockResolvedValue(undefined),
      pdf: jest.fn().mockResolvedValue(Buffer.from('%PDF-1.4 mock pdf data')),
    }),
    close: jest.fn().mockResolvedValue(undefined),
  };
});

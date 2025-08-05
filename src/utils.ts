export const minimizeAddress = (address: string) => {
  return `${address.slice(0, 8)}...${address.slice(-6)}`;
}
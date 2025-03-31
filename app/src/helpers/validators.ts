export const validators = {
  email: (value: string) => {
    return /^[a-z0-9.]+@[a-z0-9]+\.[a-z]+\.([a-z]+)?$/i.test(value);
  },
};

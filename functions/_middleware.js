export const onRequest = async (context) => {
  // The 'ASSETS' binding is now available on context.env
  return await context.env.ASSETS.fetch(context.request);
};



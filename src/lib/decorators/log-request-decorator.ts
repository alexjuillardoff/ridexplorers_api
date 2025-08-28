// Décorateur de méthode qui journalise la requête HTTP reçue (URL, verbe,
// corps et en-têtes) avant d'exécuter la méthode cible.
export default function LogRequest(): MethodDecorator {
  return (target: Object, propertyKey: string | Symbol, descriptor: PropertyDescriptor) => {
    const original = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const [request] = args;
      const { url, method, body, headers } = request;

      console.log(`[REQUEST](${url})`, {
        method,
        body,
        headers,
      });

      return original.apply(this, args);
    };
  };
}

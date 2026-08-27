declare module '*.css' {
  const classes: { [key: string]: string };
  export default classes;
  export = classes;
}

declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
  export = classes;
  export const card: string;
  // Add more named exports as needed
}

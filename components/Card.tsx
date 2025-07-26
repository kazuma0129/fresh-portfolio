import { VNode } from "preact";

interface CardProp {
  title: string;
  children?: VNode | VNode[];
}

export const Card = ({ title, children }: CardProp) => {
  return (
    <div>
      <article>
        <header>
          <h1>{title}</h1>
        </header>
        <body>{children}</body>
      </article>
    </div>
  );
};

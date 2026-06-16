import "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "addi-widget": {
        "ally-slug"?: string;
        amount?: string | number;
        country?: string;
        class?: string;
        style?: string;
      };
    }
  }
}

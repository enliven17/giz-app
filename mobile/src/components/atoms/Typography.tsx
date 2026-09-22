import { Text, type TextProps } from "react-native";
const variants = {
  title: "text-4xl font-bold text-text",
  heading: "text-2xl font-semibold text-text",
  body: "text-base leading-6 text-muted",
  label: "text-sm font-semibold text-accent",
};
export function Typography({
  variant = "body",
  ...props
}: TextProps & { variant?: keyof typeof variants }) {
  return (
    <Text
      accessibilityRole={variant === "title" || variant === "heading" ? "header" : undefined}
      {...props}
      className={variants[variant]}
    />
  );
}

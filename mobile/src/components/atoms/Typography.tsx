import { Text, useWindowDimensions, type TextProps } from "react-native";
const variants = {
  title: "text-4xl font-bold text-text",
  heading: "text-2xl font-semibold text-text",
  body: "text-base leading-6 text-muted",
  balance: "text-4xl font-semibold text-text",
  value: "text-xl font-semibold text-text",
  caption: "text-sm leading-5 text-muted",
  label: "text-sm font-semibold text-accent",
};
export function Typography({
  variant = "body",
  ...props
}: TextProps & { variant?: keyof typeof variants }) {
  // Remeasure native text after Dynamic Type changes, including on inactive screens.
  // Remount only the text node so feature and navigation state are retained.
  const { fontScale } = useWindowDimensions();
  return (
    <Text
      key={fontScale}
      accessibilityRole={variant === "title" || variant === "heading" ? "header" : undefined}
      {...props}
      className={variants[variant]}
    />
  );
}

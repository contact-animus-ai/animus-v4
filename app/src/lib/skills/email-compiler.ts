/**
 * Skill: Email Compiler
 * Converts email component JSON → MJML → production HTML.
 */

import mjml2html from "mjml";
import type { EmailComponent, BrandConfig } from "./email-generator";

function componentToMjml(component: EmailComponent, brand: BrandConfig): string {
  const { type, props } = component;

  switch (type) {
    case "HeadingBlock": {
      const level = (props.level as string) ?? "h1";
      const fontSize = (props.fontSize as string) ?? (level === "h1" ? "28px" : level === "h2" ? "22px" : "18px");
      return `<mj-text align="${props.alignment ?? "left"}" color="${props.color ?? brand.primary_color}" font-family="${brand.font_heading}, Arial, sans-serif" font-size="${fontSize}" font-weight="bold" padding="10px 25px"><${level}>${props.text}</${level}></mj-text>`;
    }

    case "TextBlock":
      return `<mj-text align="${props.alignment ?? "left"}" color="${props.color ?? "#333333"}" font-family="${brand.font_body}, Arial, sans-serif" font-size="${props.fontSize ?? "16px"}" padding="10px 25px" line-height="1.6">${props.text}</mj-text>`;

    case "ButtonBlock":
      return `<mj-button align="${props.alignment ?? "center"}" background-color="${props.bgColor ?? brand.primary_color}" color="${props.textColor ?? "#ffffff"}" border-radius="${props.borderRadius ?? "4px"}" font-family="${brand.font_body}, Arial, sans-serif" font-size="16px" inner-padding="${props.padding ?? "12px 24px"}" href="${props.href ?? "#"}">${props.text}</mj-button>`;

    case "ImageBlock":
      return `<mj-image src="${props.src}" alt="${props.alt ?? ""}" width="${props.width ?? "600px"}" padding="10px 25px" />`;

    case "SpacerBlock":
      return `<mj-spacer height="${props.height ?? "20px"}" />`;

    case "DividerBlock":
      return `<mj-divider border-color="${props.borderColor ?? "#eeeeee"}" border-width="${props.borderWidth ?? "1px"}" padding="10px 25px" />`;

    case "SectionBlock": {
      const children = (component.children ?? [])
        .map((child) => componentToMjml(child, brand))
        .join("\n");
      return `<mj-section background-color="${props.backgroundColor ?? "#ffffff"}" padding-top="${props.paddingTop ?? "20px"}" padding-bottom="${props.paddingBottom ?? "20px"}">
  <mj-column>
    ${children}
  </mj-column>
</mj-section>`;
    }

    default:
      return "";
  }
}

export function compileEmailToHtml(
  components: EmailComponent[],
  brand: BrandConfig,
  options?: { subject?: string; previewText?: string }
): string {
  // Separate section blocks from loose components
  const mjmlBody = components
    .map((component) => {
      if (component.type === "SectionBlock") {
        return componentToMjml(component, brand);
      }
      // Wrap non-section components in a section
      return `<mj-section>
  <mj-column>
    ${componentToMjml(component, brand)}
  </mj-column>
</mj-section>`;
    })
    .join("\n");

  const previewText = options?.previewText
    ? `<mj-preview>${options.previewText}</mj-preview>`
    : "";

  const mjmlTemplate = `<mjml>
  <mj-head>
    <mj-attributes>
      <mj-all font-family="${brand.font_body}, Arial, sans-serif" />
      <mj-text font-size="16px" color="#333333" line-height="1.6" />
    </mj-attributes>
    ${previewText}
  </mj-head>
  <mj-body background-color="#f4f4f4" width="600px">
    ${mjmlBody}
  </mj-body>
</mjml>`;

  const result = mjml2html(mjmlTemplate, {
    validationLevel: "soft",
    minify: true,
  });

  if (result.errors.length > 0) {
    console.warn("MJML compilation warnings:", result.errors);
  }

  return result.html;
}

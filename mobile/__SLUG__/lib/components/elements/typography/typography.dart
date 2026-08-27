import 'package:flutter/material.dart';

import '../../i18n/TranslationsProvider.dart';

class _ResolvedTypography {
  final String text;
  final TextStyle style;

  const _ResolvedTypography(this.text, this.style);
}

_ResolvedTypography _resolveTypography({
  required BuildContext context,
  required String rawText,
  required String? i18nKey,
  required Map<String, dynamic>? i18nParams,
  required TextStyle? themeStyle,
  required Color? color,
}) {
  var text = rawText;
  if (i18nKey != null) {
    text = Translations.of(context).translate(i18nKey, i18nParams);
  }

  final defaultStyle = DefaultTextStyle.of(context).style;
  final merged = defaultStyle.merge(themeStyle);

  // If no color is provided, keep whatever color comes from DefaultTextStyle/theme.
  final style = merged.copyWith(color: color ?? defaultStyle.color);

  return _ResolvedTypography(text, style);
}

abstract class _TypographyBase extends StatelessWidget {
  final String rawText;
  final String? i18nKey;
  final Map<String, dynamic>? i18nParams;
  final TextAlign? textAlign;
  final Color? color;
  final int? maxLines;
  final TextOverflow? overflow;

  const _TypographyBase({
    super.key,
    this.i18nKey,
    this.i18nParams,
    this.rawText = '',
    this.textAlign,
    this.color,
    this.maxLines,
    this.overflow,
  });

  TextStyle? themeTextStyle(BuildContext context);

  @override
  Widget build(BuildContext context) {
    final resolved = _resolveTypography(
      context: context,
      rawText: rawText,
      i18nKey: i18nKey,
      i18nParams: i18nParams,
      themeStyle: themeTextStyle(context),
      color: color,
    );

    return Text(
      resolved.text,
      style: resolved.style,
      textAlign: textAlign,
      maxLines: maxLines,
      overflow: overflow,
    );
  }
}

class DisplayLarge extends _TypographyBase {
  const DisplayLarge({
    super.key,
    super.i18nKey,
    super.i18nParams,
    super.rawText = "",
    super.textAlign,
    super.color,
    super.maxLines,
    super.overflow,
  });

  @override
  TextStyle? themeTextStyle(BuildContext context) => Theme.of(context).textTheme.displayLarge;
}

class DisplayMedium extends _TypographyBase {
  const DisplayMedium({
    super.key,
    super.i18nKey,
    super.i18nParams,
    super.rawText = "",
    super.textAlign,
    super.color,
    super.maxLines,
    super.overflow,
  });

  @override
  TextStyle? themeTextStyle(BuildContext context) => Theme.of(context).textTheme.displayMedium;
}

class DisplaySmall extends _TypographyBase {
  const DisplaySmall({
    super.key,
    super.i18nKey,
    super.i18nParams,
    super.rawText = "",
    super.textAlign,
    super.color,
    super.maxLines,
    super.overflow,
  });

  @override
  TextStyle? themeTextStyle(BuildContext context) => Theme.of(context).textTheme.displaySmall;
}

class HeadlineLarge extends _TypographyBase {
  const HeadlineLarge({
    super.key,
    super.i18nKey,
    super.i18nParams,
    super.rawText = "",
    super.textAlign,
    super.color,
    super.maxLines,
    super.overflow,
  });

  @override
  TextStyle? themeTextStyle(BuildContext context) => Theme.of(context).textTheme.headlineLarge;
}

class HeadlineMedium extends _TypographyBase {
  const HeadlineMedium({
    super.key,
    super.i18nKey,
    super.i18nParams,
    super.rawText = "",
    super.textAlign,
    super.color,
    super.maxLines,
    super.overflow,
  });

  @override
  TextStyle? themeTextStyle(BuildContext context) => Theme.of(context).textTheme.headlineMedium;
}

class HeadlineSmall extends _TypographyBase {
  const HeadlineSmall({
    super.key,
    super.i18nKey,
    super.i18nParams,
    super.rawText = "",
    super.textAlign,
    super.color,
    super.maxLines,
    super.overflow,
  });

  @override
  TextStyle? themeTextStyle(BuildContext context) => Theme.of(context).textTheme.headlineSmall;
}

class TitleLarge extends _TypographyBase {
  const TitleLarge({
    super.key,
    super.i18nKey,
    super.i18nParams,
    super.rawText = "",
    super.textAlign,
    super.color,
    super.maxLines,
    super.overflow,
  });

  @override
  TextStyle? themeTextStyle(BuildContext context) => Theme.of(context).textTheme.titleLarge;
}

class TitleMedium extends _TypographyBase {
  const TitleMedium({
    super.key,
    super.i18nKey,
    super.i18nParams,
    super.rawText = "",
    super.textAlign,
    super.color,
    super.maxLines,
    super.overflow,
  });

  @override
  TextStyle? themeTextStyle(BuildContext context) => Theme.of(context).textTheme.titleMedium;
}

class TitleSmall extends _TypographyBase {
  const TitleSmall({
    super.key,
    super.i18nKey,
    super.i18nParams,
    super.rawText = "",
    super.textAlign,
    super.color,
    super.maxLines,
    super.overflow,
  });

  @override
  TextStyle? themeTextStyle(BuildContext context) => Theme.of(context).textTheme.titleSmall;
}

class BodyLarge extends _TypographyBase {
  const BodyLarge({
    super.key,
    super.i18nKey,
    super.i18nParams,
    super.rawText = "",
    super.textAlign,
    super.color,
    super.maxLines,
    super.overflow,
  });

  @override
  TextStyle? themeTextStyle(BuildContext context) => Theme.of(context).textTheme.bodyLarge;
}

class BodyMedium extends _TypographyBase {
  const BodyMedium({
    super.key,
    super.i18nKey,
    super.i18nParams,
    super.rawText = "",
    super.textAlign,
    super.color,
    super.maxLines,
    super.overflow,
  });

  @override
  TextStyle? themeTextStyle(BuildContext context) => Theme.of(context).textTheme.bodyMedium;
}

class BodySmall extends _TypographyBase {
  const BodySmall({
    super.key,
    super.i18nKey,
    super.i18nParams,
    super.rawText = "",
    super.textAlign,
    super.color,
    super.maxLines,
    super.overflow,
  });

  @override
  TextStyle? themeTextStyle(BuildContext context) => Theme.of(context).textTheme.bodySmall;
}

class LabelLarge extends _TypographyBase {
  const LabelLarge({
    super.key,
    super.i18nKey,
    super.i18nParams,
    super.rawText = "",
    super.textAlign,
    super.color,
    super.maxLines,
    super.overflow,
  });

  @override
  TextStyle? themeTextStyle(BuildContext context) => Theme.of(context).textTheme.labelLarge;
}

class LabelMedium extends _TypographyBase {
  const LabelMedium({
    super.key,
    super.i18nKey,
    super.i18nParams,
    super.rawText = "",
    super.textAlign,
    super.color,
    super.maxLines,
    super.overflow,
  });

  @override
  TextStyle? themeTextStyle(BuildContext context) => Theme.of(context).textTheme.labelMedium;
}

class LabelSmall extends _TypographyBase {
  const LabelSmall({
    super.key,
    super.i18nKey,
    super.i18nParams,
    super.rawText = "",
    super.textAlign,
    super.color,
    super.maxLines,
    super.overflow,
  });

  @override
  TextStyle? themeTextStyle(BuildContext context) => Theme.of(context).textTheme.labelSmall;
}

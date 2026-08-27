// dart format width=80
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_import, prefer_relative_imports, directives_ordering

// GENERATED CODE - DO NOT MODIFY BY HAND

// **************************************************************************
// AppGenerator
// **************************************************************************

// ignore_for_file: no_leading_underscores_for_library_prefixes
import 'package:widgetbook/widgetbook.dart' as _widgetbook;
import 'package:widgetbook_catalog/use_cases/elements/buttons/buttons_use_case.dart'
    as _widgetbook_catalog_use_cases_elements_buttons_buttons_use_case;
import 'package:widgetbook_catalog/use_cases/elements/containers/card_use_case.dart'
    as _widgetbook_catalog_use_cases_elements_containers_card_use_case;
import 'package:widgetbook_catalog/use_cases/elements/inputs/date_range_selector_use_case.dart'
    as _widgetbook_catalog_use_cases_elements_inputs_date_range_selector_use_case;
import 'package:widgetbook_catalog/use_cases/elements/inputs/date_selector_use_case.dart'
    as _widgetbook_catalog_use_cases_elements_inputs_date_selector_use_case;
import 'package:widgetbook_catalog/use_cases/elements/inputs/signature_use_case.dart'
    as _widgetbook_catalog_use_cases_elements_inputs_signature_use_case;
import 'package:widgetbook_catalog/use_cases/elements/inputs/text_input_use_case.dart'
    as _widgetbook_catalog_use_cases_elements_inputs_text_input_use_case;
import 'package:widgetbook_catalog/use_cases/elements/navigation/bottom_nav_bar_use_case.dart'
    as _widgetbook_catalog_use_cases_elements_navigation_bottom_nav_bar_use_case;
import 'package:widgetbook_catalog/use_cases/elements/typography/typography_use_case.dart'
    as _widgetbook_catalog_use_cases_elements_typography_typography_use_case;
import 'package:widgetbook_catalog/use_cases/style_guide/colors_use_case.dart'
    as _widgetbook_catalog_use_cases_style_guide_colors_use_case;
import 'package:widgetbook_catalog/use_cases/style_guide/theme_tokens_use_case.dart'
    as _widgetbook_catalog_use_cases_style_guide_theme_tokens_use_case;
import 'package:widgetbook_catalog/use_cases/style_guide/typography_scale_use_case.dart'
    as _widgetbook_catalog_use_cases_style_guide_typography_scale_use_case;

final directories = <_widgetbook.WidgetbookNode>[
  _widgetbook.WidgetbookComponent(
    name: 'AppElevation',
    useCases: [
      _widgetbook.WidgetbookUseCase(
        name: 'Elevation',
        builder: _widgetbook_catalog_use_cases_style_guide_theme_tokens_use_case
            .themeTokensUseCase,
      ),
    ],
  ),
  _widgetbook.WidgetbookComponent(
    name: 'AppPalette',
    useCases: [
      _widgetbook.WidgetbookUseCase(
        name: 'Palette',
        builder: _widgetbook_catalog_use_cases_style_guide_colors_use_case
            .colorsUseCase,
      ),
    ],
  ),
  _widgetbook.WidgetbookFolder(
    name: 'components',
    children: [
      _widgetbook.WidgetbookFolder(
        name: 'elements',
        children: [
          _widgetbook.WidgetbookFolder(
            name: 'buttons',
            children: [
              _widgetbook.WidgetbookComponent(
                name: 'DestructiveButton',
                useCases: [
                  _widgetbook.WidgetbookUseCase(
                    name: 'Default',
                    builder:
                        _widgetbook_catalog_use_cases_elements_buttons_buttons_use_case
                            .destructiveButtonDefault,
                  ),
                ],
              ),
              _widgetbook.WidgetbookComponent(
                name: 'PrimaryButton',
                useCases: [
                  _widgetbook.WidgetbookUseCase(
                    name: 'Default',
                    builder:
                        _widgetbook_catalog_use_cases_elements_buttons_buttons_use_case
                            .primaryButtonDefault,
                  ),
                  _widgetbook.WidgetbookUseCase(
                    name: 'Disabled',
                    builder:
                        _widgetbook_catalog_use_cases_elements_buttons_buttons_use_case
                            .primaryButtonDisabled,
                  ),
                  _widgetbook.WidgetbookUseCase(
                    name: 'With icon',
                    builder:
                        _widgetbook_catalog_use_cases_elements_buttons_buttons_use_case
                            .primaryButtonWithIcon,
                  ),
                ],
              ),
              _widgetbook.WidgetbookComponent(
                name: 'SecondaryButton',
                useCases: [
                  _widgetbook.WidgetbookUseCase(
                    name: 'Default',
                    builder:
                        _widgetbook_catalog_use_cases_elements_buttons_buttons_use_case
                            .secondaryButtonDefault,
                  ),
                ],
              ),
              _widgetbook.WidgetbookComponent(
                name: 'WarningButton',
                useCases: [
                  _widgetbook.WidgetbookUseCase(
                    name: 'Default',
                    builder:
                        _widgetbook_catalog_use_cases_elements_buttons_buttons_use_case
                            .warningButtonDefault,
                  ),
                ],
              ),
            ],
          ),
          _widgetbook.WidgetbookFolder(
            name: 'containers',
            children: [
              _widgetbook.WidgetbookComponent(
                name: 'CustomCard',
                useCases: [
                  _widgetbook.WidgetbookUseCase(
                    name: 'Long content',
                    builder:
                        _widgetbook_catalog_use_cases_elements_containers_card_use_case
                            .cardLongContent,
                  ),
                  _widgetbook.WidgetbookUseCase(
                    name: 'Short content',
                    builder:
                        _widgetbook_catalog_use_cases_elements_containers_card_use_case
                            .cardShortContent,
                  ),
                ],
              ),
            ],
          ),
          _widgetbook.WidgetbookFolder(
            name: 'inputs',
            children: [
              _widgetbook.WidgetbookComponent(
                name: 'DateRangeSelector',
                useCases: [
                  _widgetbook.WidgetbookUseCase(
                    name: 'Default',
                    builder:
                        _widgetbook_catalog_use_cases_elements_inputs_date_range_selector_use_case
                            .dateRangeSelectorDefault,
                  ),
                ],
              ),
              _widgetbook.WidgetbookComponent(
                name: 'DateSelector',
                useCases: [
                  _widgetbook.WidgetbookUseCase(
                    name: 'Date and time',
                    builder:
                        _widgetbook_catalog_use_cases_elements_inputs_date_selector_use_case
                            .dateSelectorWithTime,
                  ),
                  _widgetbook.WidgetbookUseCase(
                    name: 'Date only',
                    builder:
                        _widgetbook_catalog_use_cases_elements_inputs_date_selector_use_case
                            .dateSelectorDateOnly,
                  ),
                ],
              ),
              _widgetbook.WidgetbookComponent(
                name: 'SignatureInput',
                useCases: [
                  _widgetbook.WidgetbookUseCase(
                    name: 'Default',
                    builder:
                        _widgetbook_catalog_use_cases_elements_inputs_signature_use_case
                            .signatureInputDefault,
                  ),
                ],
              ),
              _widgetbook.WidgetbookComponent(
                name: 'TextInput',
                useCases: [
                  _widgetbook.WidgetbookUseCase(
                    name: 'Default',
                    builder:
                        _widgetbook_catalog_use_cases_elements_inputs_text_input_use_case
                            .textInputDefault,
                  ),
                  _widgetbook.WidgetbookUseCase(
                    name: 'Error state',
                    builder:
                        _widgetbook_catalog_use_cases_elements_inputs_text_input_use_case
                            .textInputError,
                  ),
                  _widgetbook.WidgetbookUseCase(
                    name: 'Obscured (password)',
                    builder:
                        _widgetbook_catalog_use_cases_elements_inputs_text_input_use_case
                            .textInputObscured,
                  ),
                ],
              ),
            ],
          ),
          _widgetbook.WidgetbookFolder(
            name: 'navigation',
            children: [
              _widgetbook.WidgetbookComponent(
                name: 'BottomNavBar',
                useCases: [
                  _widgetbook.WidgetbookUseCase(
                    name: 'Default',
                    builder:
                        _widgetbook_catalog_use_cases_elements_navigation_bottom_nav_bar_use_case
                            .bottomNavBarDefault,
                  ),
                ],
              ),
            ],
          ),
          _widgetbook.WidgetbookFolder(
            name: 'typography',
            children: [
              _widgetbook.WidgetbookComponent(
                name: 'DisplayLarge',
                useCases: [
                  _widgetbook.WidgetbookUseCase(
                    name: 'Scale',
                    builder:
                        _widgetbook_catalog_use_cases_elements_typography_typography_use_case
                            .typographyScale,
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    ],
  ),
  _widgetbook.WidgetbookFolder(
    name: 'material',
    children: [
      _widgetbook.WidgetbookComponent(
        name: 'ThemeData',
        useCases: [
          _widgetbook.WidgetbookUseCase(
            name: 'Type scale',
            builder:
                _widgetbook_catalog_use_cases_style_guide_typography_scale_use_case
                    .typographyScaleUseCase,
          ),
        ],
      ),
    ],
  ),
];

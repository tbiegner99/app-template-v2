import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:mobile/components/i18n/TranslationsProvider.dart';

import '../../components/elements/buttons/buttons.dart';
import '../../components/elements/containers/Card.dart';
import '../../components/elements/inputs/DateRangeSelector.dart';
import '../../components/elements/inputs/DateSelector.dart';
import '../../components/elements/inputs/DropdownInput.dart';
import '../../components/elements/inputs/ImagePicker.dart';
import '../../components/elements/inputs/PhotoAnnotator.dart';
import '../../components/elements/inputs/SearchableDropdownInput.dart';
import '../../components/elements/inputs/Signature.dart';
import '../../components/elements/inputs/TextInput.dart';
import '../../components/elements/typography/typography.dart';

class ProfileScreen extends StatefulWidget {
  static const routePath = '/auth/profile';
  static const displayName = 'Profile';

  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  Uint8List? _signatureData;
  String _textInputValue = '';
  Uint8List? _annotatedImageData;
  DateTime? _selectedDate;
  DateTimeRange? _selectedDateRange;
  String? _dropdownValue;
  String? _searchableDropdownValue;
  bool _initialized = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) setState(() => _initialized = true);
    });
  }

  @override
  Widget build(BuildContext context) {
    final t = Translations.of(context);

    return !_initialized
        ? const SizedBox.shrink()
        : SingleChildScrollView(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16.0),
                  child: SearchableDropdownInput<String>(
                    labelText: t.translate('inputs.searchableDropdown.label', null),
                    selectedValue: _searchableDropdownValue,
                    items: const [
                      'Apple',
                      'Banana',
                      'Cherry',
                      'Date',
                      'Elderberry',
                      'Fig',
                      'Grape',
                    ],
                    onChanged: (value) => setState(() => _searchableDropdownValue = value),
                    itemToString: (String item) => item,
                  ),
                ),
                const SizedBox(height: 24),
                const DisplayLarge(i18nKey: 'Display Large'),
                const DisplayMedium(rawText: 'Display Medium'),
                const DisplaySmall(rawText: 'Display Small'),
                const HeadlineLarge(rawText: 'Headline Large'),
                const HeadlineMedium(rawText: 'Headline Medium'),
                const HeadlineSmall(rawText: 'Headline Small'),
                const TitleLarge(rawText: 'Title Large'),
                const TitleMedium(rawText: 'Title Medium'),
                const TitleSmall(rawText: 'Title Small'),
                const BodyLarge(rawText: 'Body Large'),
                const BodyMedium(rawText: 'Body Medium'),
                const BodySmall(rawText: 'Body Small'),
                const LabelLarge(rawText: 'Label Large'),
                const LabelMedium(rawText: 'Label Medium'),
                const LabelSmall(rawText: 'Label Small'),
                const SizedBox(height: 24),
                const CustomCard(child: BodyMedium(i18nKey: 'cards.example.title')),
                const SizedBox(height: 24),
                PrimaryButton(
                  onPressed: () => Translations.of(context).changeLocale(const Locale("en", "us")),
                  size: ButtonSize.medium,
                  icon: Icons.star,
                  child: const BodyMedium(i18nKey: 'buttons.primary'),
                ),
                const SizedBox(height: 12),
                SecondaryButton(
                  onPressed: () => Translations.of(context).changeLocale(const Locale("es", "mx")),
                  size: ButtonSize.small,
                  child: const BodyMedium(i18nKey: 'buttons.secondary'),
                ),
                const SizedBox(height: 12),
                DestructiveButton(
                  onPressed: () {},
                  size: ButtonSize.large,
                  icon: Icons.delete,
                  child: const BodyMedium(i18nKey: 'buttons.destructive'),
                ),
                const SizedBox(height: 12),
                WarningButton(
                  onPressed: () {},
                  size: ButtonSize.medium,
                  icon: Icons.warning,
                  child: const BodyMedium(i18nKey: 'buttons.warning'),
                ),
                const SizedBox(height: 12),
                SuccessButton(
                  onPressed: () {},
                  size: ButtonSize.large,
                  icon: Icons.check_circle,
                  child: const BodyMedium(i18nKey: 'buttons.success'),
                ),
                const SizedBox(height: 12),
                InfoButton(
                  onPressed: () {},
                  size: ButtonSize.medium,
                  icon: Icons.info_outline,
                  child: const BodyMedium(i18nKey: 'buttons.info'),
                ),
                const SizedBox(height: 24),
                SignatureInput(
                  showUndo: false,
                  onAccept: (data) {
                    setState(() => _signatureData = data);
                    if (data != null) {
                      showDialog(
                        context: context,
                        builder: (context) => AlertDialog(
                          title: const TitleMedium(i18nKey: 'signature.dialog.title'),
                          content: Image.memory(data),
                          actions: [
                            TextButton(
                              onPressed: () => Navigator.of(context).pop(),
                              child: const BodyMedium(i18nKey: 'buttons.close'),
                            ),
                          ],
                        ),
                      );
                    }
                  },
                ),
                if (_signatureData != null)
                  Padding(padding: const EdgeInsets.all(8.0), child: Image.memory(_signatureData!)),
                const SizedBox(height: 24),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16.0),
                  child: TextInput(
                    labelText: 'Example',
                    hintText: 'Enter some text',
                    showDictation: true,
                    value: _textInputValue,
                    lines: 4,
                    onChange: (value) => setState(() => _textInputValue = value),
                  ),
                ),
                const SizedBox(height: 24),
                ImagePickerInput(
                  onImagePicked: (file) async {
                    final imageData = await file.readAsBytes();
                    if (!mounted) return;
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => _PhotoAnnotatorPage(
                          imageData: imageData,
                          onAccept: (annotatedData) {
                            setState(() => _annotatedImageData = annotatedData);
                            Navigator.of(context).pop();
                          },
                        ),
                      ),
                    );
                  },
                ),
                if (_annotatedImageData != null)
                  Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: Image.memory(_annotatedImageData!),
                  ),
                const SizedBox(height: 24),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16.0),
                  child: DateSelector(
                    labelText: 'Select Date',
                    showTime: true,
                    initialDate: _selectedDate,
                    onDateSelected: (date) => setState(() => _selectedDate = date),
                  ),
                ),
                const SizedBox(height: 24),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16.0),
                  child: DateRangeSelector(
                    labelText: 'Select Date Range',
                    initialDateRange: _selectedDateRange,
                    onDateRangeSelected: (dateRange) =>
                        setState(() => _selectedDateRange = dateRange),
                  ),
                ),
                const SizedBox(height: 24),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16.0),
                  child: DropdownInput<String>(
                    labelText: 'Select an Option',
                    selectedValue: _dropdownValue,
                    items: const ['Option 1', 'Option 2', 'Option 3'],
                    onChanged: (value) => setState(() => _dropdownValue = value),
                  ),
                ),
                const SizedBox(height: 24),
              ],
            ),
          ),
        ),
      );
  }
}

class _PhotoAnnotatorPage extends StatelessWidget {
  final Uint8List imageData;
  final Function(Uint8List) onAccept;

  const _PhotoAnnotatorPage({required this.imageData, required this.onAccept});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const TitleMedium(i18nKey: 'photoAnnotator.title')),
      body: PhotoAnnotator(
        imageData: imageData,
        onAccept: onAccept,
        onCancel: () => Navigator.of(context).pop(),
      ),
    );
  }
}

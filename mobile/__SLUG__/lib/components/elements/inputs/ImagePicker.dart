import 'dart:io';

import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

import '../typography/typography.dart';

class ImagePickerInput extends StatefulWidget {
  final Function(File) onImagePicked;

  const ImagePickerInput({super.key, required this.onImagePicked});

  @override
  State<ImagePickerInput> createState() => _ImagePickerInputState();
}

class _ImagePickerInputState extends State<ImagePickerInput> {
  File? _image;
  final _picker = ImagePicker();

  Future<void> _pickImage(ImageSource source) async {
    final pickedFile = await _picker.pickImage(source: source);
    if (pickedFile != null) {
      final imageFile = File(pickedFile.path);
      setState(() {
        _image = imageFile;
      });
      widget.onImagePicked(imageFile);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        if (_image != null)
          Image.file(_image!, height: 200, width: 200, fit: BoxFit.cover)
        else
          const BodyMedium(i18nKey: 'inputs.imagePicker.noImageSelected'),
        const SizedBox(height: 20),
        ElevatedButton(
          onPressed: () => _showImageSourceSheet(context),
          child: const BodyMedium(i18nKey: 'inputs.imagePicker.chooseImage'),
        ),
      ],
    );
  }

  void _showImageSourceSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      builder: (BuildContext bc) {
        return SafeArea(
          child: Wrap(
            children: <Widget>[
              ListTile(
                leading: const Icon(Icons.photo_library),
                title: const BodyMedium(i18nKey: 'inputs.imagePicker.gallery'),
                onTap: () {
                  _pickImage(ImageSource.gallery);
                  Navigator.of(context).pop();
                },
              ),
              ListTile(
                leading: const Icon(Icons.camera_alt),
                title: const BodyMedium(i18nKey: 'inputs.imagePicker.camera'),
                onTap: () {
                  _pickImage(ImageSource.camera);
                  Navigator.of(context).pop();
                },
              ),
            ],
          ),
        );
      },
    );
  }
}

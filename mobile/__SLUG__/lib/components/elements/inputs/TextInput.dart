import 'package:flutter/material.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;

class TextInput extends StatefulWidget {
  final String? value;
  final String? labelText;
  final String? hintText;
  final Icon? prefixIcon;
  final bool obscureText;
  final ValueChanged<String>? onChange;
  final FormFieldValidator<String>? validator;
  final TextInputType? keyboardType;
  final TextInputAction? textInputAction;
  final FocusNode? focusNode;
  final VoidCallback? onEditingComplete;
  final ValueChanged<String>? onFieldSubmitted;
  final bool showDictation;
  final int? maxLength;
  final int? lines;

  const TextInput({
    super.key,
    this.value,
    this.labelText,
    this.hintText,
    this.prefixIcon,
    this.obscureText = false,
    this.onChange,
    this.validator,
    this.keyboardType,
    this.textInputAction,
    this.focusNode,
    this.onEditingComplete,
    this.onFieldSubmitted,
    this.showDictation = false,
    this.maxLength,
    this.lines,
  });

  @override
  State<TextInput> createState() => _TextInputState();
}

class _TextInputState extends State<TextInput> {
  late stt.SpeechToText _speech;
  bool _isListening = false;
  late TextEditingController _controller;

  @override
  void initState() {
    super.initState();
    _speech = stt.SpeechToText();
    _controller = TextEditingController(text: widget.value);
  }

  @override
  void didUpdateWidget(TextInput oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.value != oldWidget.value && widget.value != _controller.text) {
      _controller.text = widget.value ?? '';
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: _controller,
      maxLength: widget.maxLength,
      minLines: widget.lines,
      maxLines: widget.obscureText ? 1 : widget.lines,
      decoration: InputDecoration(
        labelText: widget.labelText,
        hintText: widget.hintText,
        prefixIcon: widget.prefixIcon,
        suffixIcon: widget.showDictation
            ? IconButton(icon: Icon(_isListening ? Icons.mic : Icons.mic_none), onPressed: _listen)
            : null,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8.0)),
      ),
      obscureText: widget.obscureText,
      onChanged: widget.onChange,
      validator: widget.validator,
      keyboardType: widget.keyboardType,
      textInputAction: widget.textInputAction,
      focusNode: widget.focusNode,
      onEditingComplete: widget.onEditingComplete,
      onFieldSubmitted: widget.onFieldSubmitted,
    );
  }

  void _listen() async {
    if (!_isListening) {
      bool available = await _speech.initialize(
        onStatus: (val) => print('onStatus: $val'),
        onError: (val) => print('onError: $val'),
      );
      if (available) {
        setState(() => _isListening = true);
        _speech.listen(
          onResult: (val) {
            setState(() {
              _controller.text = val.recognizedWords;
              if (widget.onChange != null) {
                widget.onChange!(val.recognizedWords);
              }
            });
          },
        );
      }
    } else {
      setState(() => _isListening = false);
      _speech.stop();
    }
  }
}

import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:signature/signature.dart';

class SignatureInput extends StatefulWidget {
  final double? width;
  final double? height;
  final Color? backgroundColor;
  final bool showUndo;
  final Function(Uint8List?)? onAccept;

  const SignatureInput({
    super.key,
    this.width,
    this.height,
    this.backgroundColor,
    this.showUndo = false,
    this.onAccept,
  });

  @override
  State<SignatureInput> createState() => _SignatureInputState();
}

class _SignatureInputState extends State<SignatureInput> {
  final SignatureController _controller = SignatureController(
    penStrokeWidth: 2,
    penColor: Colors.black,
    exportBackgroundColor: Colors.transparent,
  );

  @override
  Widget build(BuildContext context) {
    final cardShape = Theme.of(context).cardTheme.shape;
    BorderRadius? borderRadius;
    if (cardShape is RoundedRectangleBorder) {
      borderRadius = cardShape.borderRadius.resolve(Directionality.of(context));
    }

    return Column(
      children: [
        Container(
          decoration: BoxDecoration(
            border: Border.all(color: Colors.grey.shade400),
            borderRadius: borderRadius,
          ),
          child: ClipRRect(
            borderRadius: borderRadius ?? BorderRadius.zero,
            child: Signature(
              controller: _controller,
              width: widget.width,
              height: widget.height ?? 150,
              backgroundColor: widget.backgroundColor ?? Colors.grey[200]!,
            ),
          ),
        ),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (widget.showUndo)
              IconButton(
                icon: const Icon(Icons.undo),
                onPressed: () {
                  setState(() => _controller.undo());
                },
              ),
            if (widget.showUndo)
              IconButton(
                icon: const Icon(Icons.redo),
                onPressed: () {
                  setState(() => _controller.redo());
                },
              ),
            IconButton(
              icon: const Icon(Icons.clear),
              onPressed: () {
                setState(() => _controller.clear());
              },
            ),
            if (widget.onAccept != null)
              IconButton(
                icon: const Icon(Icons.check),
                onPressed: () async {
                  if (_controller.isNotEmpty) {
                    final data = await _controller.toPngBytes();
                    widget.onAccept!(data);
                  }
                },
              ),
          ],
        ),
      ],
    );
  }
}

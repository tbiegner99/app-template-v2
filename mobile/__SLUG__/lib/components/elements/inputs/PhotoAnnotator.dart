import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:image_painter/image_painter.dart';

import '../typography/typography.dart';

class PhotoAnnotator extends StatefulWidget {
  final Uint8List? imageData;
  final Function(Uint8List)? onAccept;
  final VoidCallback? onCancel;

  const PhotoAnnotator({super.key, this.imageData, this.onAccept, this.onCancel});

  @override
  State<PhotoAnnotator> createState() => _PhotoAnnotatorState();
}

class _PhotoAnnotatorState extends State<PhotoAnnotator> {
  final _imageKey = GlobalKey<ImagePainterState>();
  late ImagePainterController _controller;

  @override
  void initState() {
    super.initState();
    _controller = ImagePainterController(color: Colors.red, strokeWidth: 5, mode: PaintMode.rect);
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        if (widget.imageData != null)
          SizedBox(
            width: MediaQuery.of(context).size.width,
            height: MediaQuery.of(context).size.height * 0.7, // Adjust height as needed
            child: ImagePainter.memory(
              widget.imageData!,
              key: _imageKey,
              controller: _controller,
              scalable: true,
              showControls: true,
              clearAllIcon: const Icon(Icons.delete),
            ),
          )
        else
          const Center(child: BodyMedium(i18nKey: 'inputs.photoAnnotator.noImageData')),
        if (widget.imageData != null)
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              TextButton(
                onPressed: () => widget.onCancel?.call(),
                child: const BodyMedium(i18nKey: 'common.cancel'),
              ),
              TextButton(
                onPressed: () async {
                  final imageData = await _controller.exportImage();
                  if (imageData != null && widget.onAccept != null) {
                    widget.onAccept!(imageData);
                  }
                },
                child: const BodyMedium(i18nKey: 'common.accept'),
              ),
            ],
          ),
      ],
    );
  }
}

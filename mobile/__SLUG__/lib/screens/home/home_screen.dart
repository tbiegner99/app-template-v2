import 'package:flutter/material.dart';

import '../../components/elements/typography/typography.dart';

class HomeScreen extends StatelessWidget {
  static const routePath = '/auth/home';
  static const displayName = 'Home';

  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Center(
      key: ValueKey('home-screen'),
      child: BodyLarge(rawText: 'Home'),
    );
  }
}

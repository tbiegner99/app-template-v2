import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../components/auth/auth_provider.dart';
import '../../../controllers/nav_controller.dart';
import '../../../core/di/service_locator.dart';
import '../../../models/favorite.dart';
import '../ContextMenu.dart';
import 'rename_favorite_dialog.dart';

class HamburgerMenu extends StatefulWidget {
  const HamburgerMenu({super.key});

  @override
  State<HamburgerMenu> createState() => _HamburgerMenuState();
}

class _HamburgerMenuState extends State<HamburgerMenu> {
  final NavController _navController = ServiceLocator.get<NavController>();
  bool _favoritesExpanded = true;

  /// Extra menu items contributed by optional feature modules, inserted
  /// between the favorites list and "Add to Favorites".
  static List<Widget> Function(BuildContext context)? extraMenuItemsBuilder;

  String? _currentDisplayName(String currentPath) => null;

  void _addToFavorites(BuildContext context, String route, String? displayName) async {
    if (displayName == null) {
      final name = await _promptForName(context);
      if (name == null || name.trim().isEmpty) return;
      await _navController.addFavorite(route, name.trim());
    } else {
      await _navController.addFavorite(route, displayName);
    }
    if (context.mounted) Navigator.of(context).pop();
  }

  Future<String?> _promptForName(BuildContext context) async {
    final controller = TextEditingController();
    return showDialog<String>(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          title: const Text('Name this screen'),
          content: TextField(
            controller: controller,
            autofocus: true,
            decoration: const InputDecoration(hintText: 'Enter a name'),
            onChanged: (_) => setDialogState(() {}),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.of(ctx).pop(), child: const Text('Cancel')),
            TextButton(
              onPressed: controller.text.trim().isEmpty ? null : () => Navigator.of(ctx).pop(controller.text),
              child: const Text('Add'),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final textTheme = Theme.of(context).textTheme;
    // Read router state here, outside ListenableBuilder, so router changes
    // don't cause the whole ListenableBuilder subtree to rebuild unnecessarily.
    final currentPath = GoRouterState.of(context).uri.path;
    final displayName = _currentDisplayName(currentPath);

    return ListenableBuilder(
      listenable: _navController,
      builder: (context, child) {
        final isFav = _navController.isFavorite(currentPath);

        return Drawer(
          child: SafeArea(
            child: Column(
              children: [
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.fromLTRB(20, 24, 20, 20),
                  decoration: BoxDecoration(color: colorScheme.primary),
                  child: Text(
                    '__DISPLAY_NAME__',
                    style: textTheme.titleLarge?.copyWith(color: colorScheme.onPrimary),
                  ),
                ),
                Expanded(
                  child: ListView(
                    padding: EdgeInsets.zero,
                    children: [
                      ListTile(
                        leading: const Icon(Icons.home_outlined),
                        title: const Text('Home'),
                        onTap: () {
                          Navigator.of(context).pop();
                          context.go('/auth/home');
                        },
                      ),
                      ListTile(
                        leading: const Icon(Icons.star),
                        title: const Text('Favorites'),
                        trailing: AnimatedRotation(
                          turns: _favoritesExpanded ? 0.5 : 0,
                          duration: const Duration(milliseconds: 200),
                          child: const Icon(Icons.keyboard_arrow_down),
                        ),
                        onTap: () => setState(() => _favoritesExpanded = !_favoritesExpanded),
                      ),
                      AnimatedCrossFade(
                        firstChild: const SizedBox.shrink(),
                        secondChild: _FavoritesList(
                          favorites: _navController.favorites,
                          navController: _navController,
                        ),
                        crossFadeState: _favoritesExpanded
                            ? CrossFadeState.showSecond
                            : CrossFadeState.showFirst,
                        duration: const Duration(milliseconds: 200),
                      ),
                    ],
                  ),
                ),
                ...?extraMenuItemsBuilder?.call(context),
                const Divider(height: 1),
                ListTile(
                  leading: Icon(
                    Icons.star_border,
                    color: isFav ? colorScheme.onSurface.withValues(alpha: 0.38) : null,
                  ),
                  title: Text(displayName != null ? 'Add "$displayName" to Favorites' : 'Add to Favorites'),
                  enabled: !isFav,
                  onTap: isFav ? null : () => _addToFavorites(context, currentPath, displayName),
                ),
                ListTile(
                  leading: const Icon(Icons.sync),
                  title: const Text('Sync'),
                  onTap: () => Navigator.of(context).pop(),
                ),
                ListTile(
                  leading: const Icon(Icons.settings_outlined),
                  title: const Text('Settings'),
                  onTap: () {
                    Navigator.of(context).pop();
                    context.go('/auth/settings');
                  },
                ),
                ListTile(
                  key: const ValueKey('logout-button'),
                  leading: Icon(Icons.logout, color: colorScheme.error),
                  title: Text('Logout', style: TextStyle(color: colorScheme.error)),
                  onTap: () async {
                    Navigator.of(context).pop();
                    await AuthProvider.of(context).signOut();
                  },
                ),
                const SizedBox(height: 8),
              ],
            ),
          ),
        );
      },
    );
  }
}

class _FavoritesList extends StatelessWidget {
  final List<Favorite> favorites;
  final NavController navController;

  const _FavoritesList({required this.favorites, required this.navController});

  @override
  Widget build(BuildContext context) {
    if (favorites.isEmpty) {
      return Padding(
        padding: const EdgeInsets.only(left: 56, right: 16, bottom: 8),
        child: Text(
          'No favorites yet',
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.5),
              ),
        ),
      );
    }

    return Column(
      children: favorites.map((f) {
        return ContextMenu(
          items: [
            ContextMenuItem(
              label: 'Rename',
              icon: Icons.edit_outlined,
              onTap: () async {
                final newName = await showDialog<String>(
                  context: context,
                  builder: (_) => RenameFavoriteDialog(currentName: f.name),
                );
                if (newName != null && newName.trim().isNotEmpty) {
                  await navController.renameFavorite(f.route, newName.trim());
                }
              },
            ),
            ContextMenuItem(
              label: 'Remove',
              icon: Icons.delete_outline,
              onTap: () => navController.removeFavorite(f.route),
            ),
          ],
          child: ListTile(
            contentPadding: const EdgeInsets.only(left: 56, right: 16),
            leading: const Icon(Icons.bookmark_border, size: 20),
            title: Text(f.name),
            dense: true,
            onTap: () {
              Navigator.of(context).pop();
              context.go(f.route);
            },
          ),
        );
      }).toList(),
    );
  }
}

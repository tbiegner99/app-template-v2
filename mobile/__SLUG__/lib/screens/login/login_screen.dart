import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/components/i18n/TranslationsProvider.dart';
import '../../components/auth/auth_provider.dart';
import '../../components/elements/buttons/buttons.dart';

class LoginScreen extends StatefulWidget {
  static const routePath = '/login';

  /// Optional redirect target after successful login
  final String? redirect;

  const LoginScreen({super.key, this.redirect});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  bool _obscurePassword = true;

  @override
  void dispose() {
    _emailCtrl.dispose();
    _passwordCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    final auth = AuthProvider.of(context);
    final ok = await auth.signIn(_emailCtrl.text.trim(), _passwordCtrl.text);
    if (!mounted) return;
    if (ok) {
      context.go(widget.redirect ?? '/auth/home');
    }
  }

  @override
  Widget build(BuildContext context) {
    final dict = Translations.of(context);
    final auth = AuthProvider.of(context);

    return Scaffold(
      body: Center(
        key: const ValueKey('login-screen'),
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 48),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  dict.translate('auth.login.title', null),
                  style: Theme.of(context).textTheme.headlineMedium,
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 32),
                if (auth.error != null)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 16),
                    child: Text(
                      dict.translate('auth.error.${auth.error}', null),
                      style: TextStyle(color: Theme.of(context).colorScheme.error),
                      textAlign: TextAlign.center,
                    ),
                  ),
                if (auth.debugError != null)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 16),
                    child: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Theme.of(context).colorScheme.errorContainer,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: SelectableText(
                        auth.debugError!,
                        style: TextStyle(
                          color: Theme.of(context).colorScheme.onErrorContainer,
                          fontFamily: 'monospace',
                          fontSize: 11,
                        ),
                      ),
                    ),
                  ),
                TextFormField(
                  key: const ValueKey('email-input'),
                  controller: _emailCtrl,
                  keyboardType: TextInputType.emailAddress,
                  decoration: InputDecoration(
                    labelText: dict.translate('auth.login.email', null),
                  ),
                  validator: (v) => (v == null || v.isEmpty)
                      ? dict.translate('auth.validation.required', null)
                      : null,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  key: const ValueKey('password-input'),
                  controller: _passwordCtrl,
                  obscureText: _obscurePassword,
                  decoration: InputDecoration(
                    labelText: dict.translate('auth.login.password', null),
                    suffixIcon: IconButton(
                      icon: Icon(_obscurePassword ? Icons.visibility_outlined : Icons.visibility_off_outlined),
                      onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                    ),
                  ),
                  validator: (v) => (v == null || v.isEmpty)
                      ? dict.translate('auth.validation.required', null)
                      : null,
                ),
                const SizedBox(height: 24),
                PrimaryButton(
                  key: const ValueKey('login-button'),
                  onPressed: auth.loading ? null : _submit,
                  enabled: !auth.loading,
                  child: auth.loading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                        )
                      : Text(dict.translate('auth.login.submit', null)),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

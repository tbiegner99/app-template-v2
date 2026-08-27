class FeatureFlag {
  final String name;
  final bool enabled;
  final DateTime dateCreated;
  final DateTime lastModified;
  final DateTime? syncedAt;

  const FeatureFlag({
    required this.name,
    required this.enabled,
    required this.dateCreated,
    required this.lastModified,
    this.syncedAt,
  });

  factory FeatureFlag.fromMap(Map<String, dynamic> map) => FeatureFlag(
        name: map['name'] as String,
        enabled: (map['enabled'] as int) == 1,
        dateCreated: DateTime.parse(map['date_created'] as String),
        lastModified: DateTime.parse(map['last_modified'] as String),
        syncedAt: map['synced_at'] != null
            ? DateTime.parse(map['synced_at'] as String)
            : null,
      );
}

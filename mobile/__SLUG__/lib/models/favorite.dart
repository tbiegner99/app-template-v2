class Favorite {
  final String route;
  final String name;
  final DateTime dateCreated;
  final DateTime lastModified;

  const Favorite({
    required this.route,
    required this.name,
    required this.dateCreated,
    required this.lastModified,
  });

  factory Favorite.fromMap(Map<String, dynamic> map) => Favorite(
        route: map['route'] as String,
        name: map['name'] as String,
        dateCreated: DateTime.parse(map['date_created'] as String),
        lastModified: DateTime.parse(map['last_modified'] as String),
      );
}

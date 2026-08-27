class ActiveAlert {
  final String id;
  final String title;
  final String body;
  final String? route;
  final int localNotificationId;
  final String dateCreated;

  const ActiveAlert({
    required this.id,
    required this.title,
    required this.body,
    this.route,
    required this.localNotificationId,
    required this.dateCreated,
  });

  factory ActiveAlert.fromMap(Map<String, dynamic> map) => ActiveAlert(
        id: map['id'] as String,
        title: map['title'] as String,
        body: map['body'] as String,
        route: map['route'] as String?,
        localNotificationId: map['local_notification_id'] as int,
        dateCreated: map['date_created'] as String,
      );

  Map<String, dynamic> toMap() => {
        'id': id,
        'title': title,
        'body': body,
        'route': route,
        'local_notification_id': localNotificationId,
        'date_created': dateCreated,
      };
}

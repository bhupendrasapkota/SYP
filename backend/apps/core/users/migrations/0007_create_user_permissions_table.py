from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [
        ('users', '0005_create_users_groups'),  # Replace with your actual latest migration if different
        ('auth', '0012_alter_user_first_name_max_length'),
        ]


    operations = [
        migrations.CreateModel(
            name='User_user_permissions',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('user', models.ForeignKey(to='users.User', on_delete=models.CASCADE)),
                ('permission', models.ForeignKey(to='auth.Permission', on_delete=models.CASCADE)),
            ],
            options={
                'db_table': 'users_user_permissions',
            },
        ),
    ]

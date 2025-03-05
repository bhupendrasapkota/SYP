from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('users', '0002_alter_user_is_superuser_alter_user_last_login'),  # Replace with your latest migration file
        ('auth', '0012_alter_user_first_name_max_length'),  # Ensure the auth app migration is listed if needed
    ]

    operations = [
        migrations.CreateModel(
            name='User_groups',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('user', models.ForeignKey(to='users.User', on_delete=models.CASCADE)),
                ('group', models.ForeignKey(to='auth.Group', on_delete=models.CASCADE)),
            ],
            options={
                'db_table': 'users_groups',
            },
        ),
    ]

# Generated by Django 5.1.6 on 2025-03-05 04:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0003_user_following_count_alter_user_followers_count'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='following_count',
            field=models.IntegerField(default=0),
        ),
    ]

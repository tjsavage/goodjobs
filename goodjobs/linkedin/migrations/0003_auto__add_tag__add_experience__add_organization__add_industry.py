# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'Tag'
        db.create_table(u'linkedin_tag', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=100)),
        ))
        db.send_create_signal(u'linkedin', ['Tag'])

        # Adding model 'Experience'
        db.create_table(u'linkedin_experience', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('organization', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['linkedin.Organization'])),
            ('startDate', self.gf('django.db.models.fields.DateField')()),
            ('endDate', self.gf('django.db.models.fields.DateField')(null=True)),
            ('summary', self.gf('django.db.models.fields.TextField')()),
            ('title', self.gf('django.db.models.fields.CharField')(max_length=100)),
            ('user', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['linkedin.UserProfile'])),
        ))
        db.send_create_signal(u'linkedin', ['Experience'])

        # Adding model 'Organization'
        db.create_table(u'linkedin_organization', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('linkedin_id', self.gf('django.db.models.fields.CharField')(max_length=200)),
            ('industry', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['linkedin.Industry'])),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=200)),
            ('size', self.gf('django.db.models.fields.CharField')(max_length=50, null=True, blank=True)),
            ('company_type', self.gf('django.db.models.fields.CharField')(max_length=100)),
        ))
        db.send_create_signal(u'linkedin', ['Organization'])

        # Adding M2M table for field tags on 'Organization'
        db.create_table(u'linkedin_organization_tags', (
            ('id', models.AutoField(verbose_name='ID', primary_key=True, auto_created=True)),
            ('organization', models.ForeignKey(orm[u'linkedin.organization'], null=False)),
            ('tag', models.ForeignKey(orm[u'linkedin.tag'], null=False))
        ))
        db.create_unique(u'linkedin_organization_tags', ['organization_id', 'tag_id'])

        # Adding model 'Industry'
        db.create_table(u'linkedin_industry', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=100)),
        ))
        db.send_create_signal(u'linkedin', ['Industry'])

        # Adding M2M table for field tags on 'UserProfile'
        db.create_table(u'linkedin_userprofile_tags', (
            ('id', models.AutoField(verbose_name='ID', primary_key=True, auto_created=True)),
            ('userprofile', models.ForeignKey(orm[u'linkedin.userprofile'], null=False)),
            ('tag', models.ForeignKey(orm[u'linkedin.tag'], null=False))
        ))
        db.create_unique(u'linkedin_userprofile_tags', ['userprofile_id', 'tag_id'])


    def backwards(self, orm):
        # Deleting model 'Tag'
        db.delete_table(u'linkedin_tag')

        # Deleting model 'Experience'
        db.delete_table(u'linkedin_experience')

        # Deleting model 'Organization'
        db.delete_table(u'linkedin_organization')

        # Removing M2M table for field tags on 'Organization'
        db.delete_table('linkedin_organization_tags')

        # Deleting model 'Industry'
        db.delete_table(u'linkedin_industry')

        # Removing M2M table for field tags on 'UserProfile'
        db.delete_table('linkedin_userprofile_tags')


    models = {
        u'linkedin.experience': {
            'Meta': {'object_name': 'Experience'},
            'endDate': ('django.db.models.fields.DateField', [], {'null': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'organization': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['linkedin.Organization']"}),
            'startDate': ('django.db.models.fields.DateField', [], {}),
            'summary': ('django.db.models.fields.TextField', [], {}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['linkedin.UserProfile']"})
        },
        u'linkedin.industry': {
            'Meta': {'object_name': 'Industry'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'})
        },
        u'linkedin.organization': {
            'Meta': {'object_name': 'Organization'},
            'company_type': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'industry': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['linkedin.Industry']"}),
            'linkedin_id': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'size': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'tags': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['linkedin.Tag']", 'symmetrical': 'False'})
        },
        u'linkedin.tag': {
            'Meta': {'object_name': 'Tag'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'})
        },
        u'linkedin.userprofile': {
            'Meta': {'object_name': 'UserProfile'},
            'date_joined': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'first_name': ('django.db.models.fields.CharField', [], {'max_length': '50'}),
            'headline': ('django.db.models.fields.CharField', [], {'max_length': '300', 'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'last_login': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'last_name': ('django.db.models.fields.CharField', [], {'max_length': '50'}),
            'linkedin_id': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '200'}),
            'oauth_code': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'oauth_token': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'password': ('django.db.models.fields.CharField', [], {'max_length': '128'}),
            'picture_url': ('django.db.models.fields.CharField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            'tags': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['linkedin.Tag']", 'symmetrical': 'False'})
        }
    }

    complete_apps = ['linkedin']
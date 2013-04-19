# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Deleting field 'Organization.size'
        db.delete_column(u'linkedin_organization', 'size')

        # Adding field 'Organization.description'
        db.add_column(u'linkedin_organization', 'description',
                      self.gf('django.db.models.fields.TextField')(null=True, blank=True),
                      keep_default=False)

        # Adding field 'Organization.website_url'
        db.add_column(u'linkedin_organization', 'website_url',
                      self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True),
                      keep_default=False)

        # Adding field 'Organization.logo_url'
        db.add_column(u'linkedin_organization', 'logo_url',
                      self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True),
                      keep_default=False)

        # Adding field 'Organization.locations_description'
        db.add_column(u'linkedin_organization', 'locations_description',
                      self.gf('django.db.models.fields.TextField')(null=True, blank=True),
                      keep_default=False)

        # Adding field 'Organization.employee_count_range'
        db.add_column(u'linkedin_organization', 'employee_count_range',
                      self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True),
                      keep_default=False)


    def backwards(self, orm):
        # Adding field 'Organization.size'
        db.add_column(u'linkedin_organization', 'size',
                      self.gf('django.db.models.fields.CharField')(max_length=50, null=True, blank=True),
                      keep_default=False)

        # Deleting field 'Organization.description'
        db.delete_column(u'linkedin_organization', 'description')

        # Deleting field 'Organization.website_url'
        db.delete_column(u'linkedin_organization', 'website_url')

        # Deleting field 'Organization.logo_url'
        db.delete_column(u'linkedin_organization', 'logo_url')

        # Deleting field 'Organization.locations_description'
        db.delete_column(u'linkedin_organization', 'locations_description')

        # Deleting field 'Organization.employee_count_range'
        db.delete_column(u'linkedin_organization', 'employee_count_range')


    models = {
        u'linkedin.experience': {
            'Meta': {'object_name': 'Experience'},
            'end_month': ('django.db.models.fields.IntegerField', [], {'null': 'True'}),
            'end_year': ('django.db.models.fields.IntegerField', [], {'null': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'linkedin_id': ('django.db.models.fields.CharField', [], {'default': 'None', 'max_length': '50', 'null': 'True'}),
            'organization': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['linkedin.Organization']", 'null': 'True'}),
            'start_month': ('django.db.models.fields.IntegerField', [], {'null': 'True'}),
            'start_year': ('django.db.models.fields.IntegerField', [], {'null': 'True'}),
            'summary': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
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
            'description': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'employee_count_range': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'industry': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['linkedin.Industry']", 'null': 'True'}),
            'linkedin_id': ('django.db.models.fields.CharField', [], {'default': 'None', 'max_length': '200', 'null': 'True'}),
            'locations_description': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'logo_url': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'tags': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['linkedin.Tag']", 'symmetrical': 'False'}),
            'website_url': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'})
        },
        u'linkedin.tag': {
            'Meta': {'object_name': 'Tag'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'})
        },
        u'linkedin.userprofile': {
            'Meta': {'object_name': 'UserProfile'},
            'date_joined': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'email': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'first_name': ('django.db.models.fields.CharField', [], {'max_length': '50'}),
            'headline': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'last_login': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'last_name': ('django.db.models.fields.CharField', [], {'max_length': '50'}),
            'linkedin_id': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '255'}),
            'oauth_code': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'oauth_token': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'password': ('django.db.models.fields.CharField', [], {'max_length': '128'}),
            'picture_url': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'tags': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['linkedin.Tag']", 'symmetrical': 'False'})
        }
    }

    complete_apps = ['linkedin']
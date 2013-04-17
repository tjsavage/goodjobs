# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):

        # Changing field 'Organization.industry'
        db.alter_column(u'linkedin_organization', 'industry_id', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['linkedin.Industry'], null=True))

        # Changing field 'Experience.organization'
        db.alter_column(u'linkedin_experience', 'organization_id', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['linkedin.Organization'], null=True))

    def backwards(self, orm):

        # User chose to not deal with backwards NULL issues for 'Organization.industry'
        raise RuntimeError("Cannot reverse this migration. 'Organization.industry' and its values cannot be restored.")

        # User chose to not deal with backwards NULL issues for 'Experience.organization'
        raise RuntimeError("Cannot reverse this migration. 'Experience.organization' and its values cannot be restored.")

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
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'industry': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['linkedin.Industry']", 'null': 'True'}),
            'linkedin_id': ('django.db.models.fields.CharField', [], {'default': 'None', 'max_length': '200', 'null': 'True'}),
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
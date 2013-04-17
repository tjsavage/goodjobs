# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Deleting field 'Experience.startDate'
        db.delete_column(u'linkedin_experience', 'startDate')

        # Deleting field 'Experience.endDate'
        db.delete_column(u'linkedin_experience', 'endDate')

        # Adding field 'Experience.startYear'
        db.add_column(u'linkedin_experience', 'startYear',
                      self.gf('django.db.models.fields.IntegerField')(default=2012),
                      keep_default=False)

        # Adding field 'Experience.startMonth'
        db.add_column(u'linkedin_experience', 'startMonth',
                      self.gf('django.db.models.fields.IntegerField')(null=True),
                      keep_default=False)

        # Adding field 'Experience.endYear'
        db.add_column(u'linkedin_experience', 'endYear',
                      self.gf('django.db.models.fields.IntegerField')(null=True),
                      keep_default=False)

        # Adding field 'Experience.endMonth'
        db.add_column(u'linkedin_experience', 'endMonth',
                      self.gf('django.db.models.fields.IntegerField')(null=True),
                      keep_default=False)


    def backwards(self, orm):

        # User chose to not deal with backwards NULL issues for 'Experience.startDate'
        raise RuntimeError("Cannot reverse this migration. 'Experience.startDate' and its values cannot be restored.")
        # Adding field 'Experience.endDate'
        db.add_column(u'linkedin_experience', 'endDate',
                      self.gf('django.db.models.fields.DateField')(null=True),
                      keep_default=False)

        # Deleting field 'Experience.startYear'
        db.delete_column(u'linkedin_experience', 'startYear')

        # Deleting field 'Experience.startMonth'
        db.delete_column(u'linkedin_experience', 'startMonth')

        # Deleting field 'Experience.endYear'
        db.delete_column(u'linkedin_experience', 'endYear')

        # Deleting field 'Experience.endMonth'
        db.delete_column(u'linkedin_experience', 'endMonth')


    models = {
        u'linkedin.experience': {
            'Meta': {'object_name': 'Experience'},
            'endMonth': ('django.db.models.fields.IntegerField', [], {'null': 'True'}),
            'endYear': ('django.db.models.fields.IntegerField', [], {'null': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'organization': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['linkedin.Organization']"}),
            'startMonth': ('django.db.models.fields.IntegerField', [], {'null': 'True'}),
            'startYear': ('django.db.models.fields.IntegerField', [], {}),
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
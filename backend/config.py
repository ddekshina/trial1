import os
from pathlib import Path
from datetime import timedelta


basedir = Path(os.path.abspath(os.path.dirname(__file__)))

class Config:
    # Flask configuration
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-key-for-development-only'
    DEBUG = False
    TESTING = False
    
    # SQLAlchemy configuration
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///instance/pricing_analyst.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_recycle': 280,  # recycle connections before Azure's 5-minute timeout
        'pool_pre_ping': True,  # verify connections before using them
    }
    
    # CORS configuration
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', 'http://localhost:5173').split(',')  # React Vite default port

    # Rate limiting
    RATELIMIT_DEFAULT = "100 per day;30 per hour;5 per minute"
    RATELIMIT_STORAGE_URI = "memory://"

    # Logging
    LOG_LEVEL = os.environ.get('LOG_LEVEL', 'INFO')

    # Security headers
    STRICT_TRANSPORT_SECURITY = os.environ.get('STRICT_TRANSPORT_SECURITY', 'max-age=31536000; includeSubDomains')
    CONTENT_SECURITY_POLICY = os.environ.get('CONTENT_SECURITY_POLICY', "default-src 'self'")


class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_TRACK_MODIFICATIONS = True


class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///instance/test.db'
    WTF_CSRF_ENABLED = False  # Disable CSRF protection in tests


class ProductionConfig(Config):
    # In production, ensure SECRET_KEY is set as an environment variable
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    STRICT_TRANSPORT_SECURITY = 'max-age=31536000; includeSubDomains; preload'
    SESSION_COOKIE_SECURE = True
    REMEMBER_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    
    # Allow overriding database URL in production
    @property
    def SQLALCHEMY_DATABASE_URI(self):
        uri = os.environ.get('DATABASE_URL')
        if uri and uri.startswith('postgres://'):
            uri = uri.replace('postgres://', 'postgresql://', 1)
        return uri


# Dictionary with different configuration environments
config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
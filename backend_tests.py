import pytest
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from unittest.mock import patch, MagicMock

class GetPublicProfileForRoiTest(APITestCase):
    def setUp(self):
        # Create a test user for authentication
        from django.contrib.auth.models import User
        self.user = User.objects.create_user(username='testuser', password='testpass')
        self.client.force_authenticate(user=self.user)

    @patch('app.use_cases.get_public_profile_for_roi.GetPublicProfileForRoiUseCase.execute')
    def test_successful_request(self, mock_execute):
        # Mock the use case response
        mock_response = MagicMock()
        mock_response.id = 1
        mock_response.platform = 'instagram'
        mock_response.username = 'testuser'
        mock_response.followers_count = 1000
        mock_response.follows_count = 500
        mock_response.media_count = 100
        mock_response.last_synced_at = None
        mock_execute.return_value = mock_response

        response = self.client.post(reverse('get_public_profile_for_roi'), {
            'username': 'testuser',
            'platform': 'instagram'
        })

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'testuser')
        self.assertEqual(response.data['followers_count'], 1000)

    def test_missing_username(self):
        response = self.client.post(reverse('get_public_profile_for_roi'), {
            'platform': 'instagram'
        })

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('username is required', response.data['error'])

    def test_invalid_json(self):
        response = self.client.post(reverse('get_public_profile_for_roi'),
                                   'invalid json',
                                   content_type='application/json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Invalid JSON body', response.data['error'])

    def test_unauthenticated_request(self):
        self.client.force_authenticate(user=None)
        response = self.client.post(reverse('get_public_profile_for_roi'), {
            'username': 'testuser'
        })

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    @patch('app.use_cases.get_public_profile_for_roi.GetPublicProfileForRoiUseCase.execute')
    def test_use_case_exception(self, mock_execute):
        from app.use_cases.shared.exceptions import UseCaseException
        mock_execute.side_effect = UseCaseException(errors={'API': 'Business Discovery failed'})

        response = self.client.post(reverse('get_public_profile_for_roi'), {
            'username': 'testuser'
        })

        self.assertEqual(response.status_code, status.HTTP_422_UNPROCESSABLE_ENTITY)
        self.assertIn('API', response.data)
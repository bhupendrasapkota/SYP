from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from .models import Like
from .serializers import LikeSerializer

class LikePhotoView(generics.CreateAPIView):
    serializer_class = LikeSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        photo_id = kwargs.get("photo_id")
        user = request.user

        if Like.objects.filter(user=user, photo_id=photo_id).exists():
            return Response({"detail": "You already liked this photo."}, status=status.HTTP_400_BAD_REQUEST)


        serializer = self.get_serializer(data={"user": user.id, "photo": photo_id})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UnlikePhotoView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, photo_id):
        user = request.user

        if not Like.objects.filter(user=user, photo_id=photo_id).exists():
            return Response({"detail": "You haven't liked this photo yet."}, status=status.HTTP_400_BAD_REQUEST)

        Like.objects.filter(user=user, photo_id=photo_id).delete()
        return Response({"detail": "Like removed successfully."}, status=status.HTTP_204_NO_CONTENT)

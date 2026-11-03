# syntax=docker/dockerfile:1
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY daily-stuff.Server.csproj ./
RUN dotnet restore

COPY . ./
RUN dotnet publish -c Release -o /app --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app ./

ENV ASPNETCORE_URLS=http://+:8080 \
    Storage__Path=/app/uploads
# Created and owned by the app user so a fresh named volume is writable.
RUN mkdir -p /app/uploads && chown -R $APP_UID /app/uploads
EXPOSE 8080
USER $APP_UID
ENTRYPOINT ["dotnet", "daily-stuff.Server.dll"]

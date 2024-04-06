FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build-env
WORKDIR /server

COPY . ./
RUN dotnet restore
RUN dotnet publish -c Release -o out

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /server
COPY --from=build-env /server/out .
ENTRYPOINT ["dotnet", "server.dll"]

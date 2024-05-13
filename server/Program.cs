using server.Services;
using server.Hubs;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.SignalR;
using server;
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();
builder.Services.AddSignalR();
builder.Services.AddSingleton<GameService>();

builder.Services.AddAuthorization();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
  {
      options.Authority = "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_M9G0voy5H";
      options.MetadataAddress = "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_M9G0voy5H/.well-known/openid-configuration";
      options.IncludeErrorDetails = true;
      options.RequireHttpsMetadata = false;
      options.TokenValidationParameters.ValidateIssuer = true;
      options.TokenValidationParameters.ValidateAudience = false;
      options.TokenValidationParameters.ValidateIssuerSigningKey = true;

      options.Events = new JwtBearerEvents
      {
          OnMessageReceived = context =>
          {
              var accessToken = context.Request.Query["access_token"];
              Console.WriteLine("Message recieved");
              Console.WriteLine(accessToken);

              // If the request is for our hub...
              var path = context.HttpContext.Request.Path;
              if (!string.IsNullOrEmpty(accessToken) &&
                  path.StartsWithSegments("/game"))
              {
                    Console.WriteLine("Token handled");
                  // Read the token out of the query string
                  context.Token = accessToken;
              }
              return Task.CompletedTask;
          }
      };
  });

builder.Services.AddSingleton<IUserIdProvider, EmailBasedUserIdProvider>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseStaticFiles();
app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");
app.MapHub<GameHub>("/game");
app.Run();

CREATE TABLE [dbo].[t_mensagens](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[idUserDe] [int] NULL,
	[idUserPara] [int] NULL,
	[mensagem] [varchar](max) NULL
)
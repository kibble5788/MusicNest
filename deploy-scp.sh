#!/bin/bash

# 简化的部署脚本（使用SCP）- 将out目录发布到远程服务器
# 用法: ./deploy-scp.sh [用户名]

# 默认参数配置
USERNAME=${1:-root}  # 默认用户名为root，可通过命令行参数修改
SERVER_IP="199.245.101.0"
REMOTE_PATH="/www/wwwroot/music.kudown.vip"
LOCAL_PATH="./out/"

# 显示开始信息
echo "开始使用SCP部署..."
echo "源目录: $LOCAL_PATH"
echo "目标服务器: $USERNAME@$SERVER_IP:$REMOTE_PATH"


# 检查本地out目录是否存在
if [ ! -d "$LOCAL_PATH" ]; then
    echo "错误: 本地out目录不存在!"
    exit 1
fi

# 使用SCP进行部署
echo "正在部署文件到服务器..."
scp -r $LOCAL_PATH/* $USERNAME@$SERVER_IP:$REMOTE_PATH

# 检查部署结果
if [ $? -eq 0 ]; then
    echo "部署成功! 文件已上传到 $USERNAME@$SERVER_IP:$REMOTE_PATH"
else
    echo "部署失败，请检查网络连接或服务器配置"
    exit 1
fi

echo "部署完成!" 
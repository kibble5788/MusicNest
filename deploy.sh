#!/bin/bash

# 部署脚本 - 将out目录发布到远程服务器
# 用法: ./deploy.sh [用户名] [密码]

# 默认参数配置
USERNAME=${SSH_USERNAME:-${1:-root}}  # 优先使用环境变量，其次使用命令行参数，默认为root
SSH_PASSWORD=${SSH_PASSWORD:-${2}}    # 优先使用环境变量，其次使用命令行参数
SERVER_IP=${SSH_SERVER_IP:-"199.245.101.0"}
REMOTE_PATH=${SSH_REMOTE_PATH:-"/www/wwwroot/music.kudown.vip"}
LOCAL_PATH="./out/"

# 显示开始信息
echo "开始部署..."
echo "源目录: $LOCAL_PATH"
echo "目标服务器: $USERNAME@$SERVER_IP:$REMOTE_PATH"

# 检查本地out目录是否存在
if [ ! -d "$LOCAL_PATH" ]; then
    echo "错误: 本地out目录不存在!"
    exit 1
fi

# 检查是否提供了密码
if [ -z "$SSH_PASSWORD" ]; then
    read -sp "请输入SSH密码: " SSH_PASSWORD
    echo
    export SSH_PASSWORD
fi

# 检查是否安装sshpass
if ! command -v sshpass &> /dev/null; then
    echo "错误: 未安装sshpass! 请先安装sshpass。"
    echo "Windows (通过scoop): scoop install sshpass"
    echo "Linux: apt-get install sshpass 或 yum install sshpass"
    echo "Mac: brew install hudochenkov/sshpass/sshpass"
    exit 1
fi

# 使用rsync和密码部署
echo "正在使用密码认证方式部署到服务器..."
sshpass -e rsync -avz -e "ssh -o StrictHostKeyChecking=no" --progress $LOCAL_PATH $USERNAME@$SERVER_IP:$REMOTE_PATH

# 检查部署结果
if [ $? -eq 0 ]; then
    echo "部署成功! 文件已上传到 $USERNAME@$SERVER_IP:$REMOTE_PATH"
else
    echo "部署失败，请检查网络连接或服务器配置"
    echo "提示: 请确认认证信息是否正确"
    exit 1
fi

echo "部署完成!" 
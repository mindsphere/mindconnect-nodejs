pipeline {
  agent {
    docker {
      image 'node'
      args '-v /home/sn0wcat/mc:/.mc -v /home/sn0wcat/'
    }
  }
  environment {
        CI = 'true'
  }
  stages {
    stage('Prepare') {
      steps {
        sh '''
        pwd
        mkdir .mc
        cp -a /.mc/. .mc/
        mkdir ~/.mc
        cp .mc/auth.json ~/.mc/
        mv .mc/private.key .
        cp .mc/2903bf15381646d3a8f4aeeff8d9bd29.json agentconfig.json
        cp .mc/68766a93af834984a8f8decfbeec961e.json agentconfig.rsa.json
        '''
      }
    }
    stage('Build') {
      steps {
        sh 'npm install'
      }
    }
    stage('Test') {
      steps {
        sh 'npm test'        
      }
    }
    stage('Package') {
      steps {
        sh '''
        npm pack --unsafe-perm
        echo $BUILD_NUMBER
        mkdir /publish/mindconnect-nodejs/$BUILD_NUMBER
        cp *.tgz /publish/mindconnect-nodejs/$BUILD_NUMBER
        '''
      }
    }
  }

  post {
      always {
          sh '''
          cp -rf .mc/*.json /.mc/
          '''
      }
  }
}
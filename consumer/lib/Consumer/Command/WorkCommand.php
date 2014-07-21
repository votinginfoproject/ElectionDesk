<?php namespace Consumer\Command;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class WorkCommand extends Command {

    protected function configure()
    {
        $this
            ->setName('work')
            ->setDescription('Starts a single consumer')
            ->addArgument(
                'consumer',
                InputArgument::REQUIRED,
                'twitter|facebook|google|datasift|gnip'
            )
            ->addArgument(
                'filter',
                InputArgument::REQUIRED,
                'id'
            )
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $consumerName = ucfirst(strtolower($input->getArgument('consumer')));

    	// Define class names
        $classNameIndividual = '\\Consumer\\IndividualConsumer\\' . $consumerName . 'Consumer';
        $className = '\\Consumer\\' . $consumerName . 'Consumer';

        // Add consumer class to list
        if (class_exists($classNameIndividual)) {
            $consumer = new $classNameIndividual;
        } elseif (class_exists($className)) {
            $consumer = new $className;
        } else {
            throw new \RuntimeException('Invalid consumer "'. $consumerName .'"');
        }

        $filter = \Consumer\Model\Filter::find($input->getArgument('filter'));

        $consumer->consume($filter);
    }

}